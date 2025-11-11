import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';

export interface BadgePrintData {
  visitorName: string;
  company?: string;
  badgeNumber: string;
  visitDate: string;
  department: string;
  host?: string;
  qrCode?: string; // base64 QR code image
  photoPath?: string;
}

export interface PrinterConnection {
  type: 'usb' | 'network' | 'file';
  address?: string; // USB device path or IP address
  port?: number; // For network printers
}

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);
  private printer: ThermalPrinter;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize printer connection
   */
  async initPrinter(connection: PrinterConnection): Promise<void> {
    try {
      let printerInterface: any;

      switch (connection.type) {
        case 'usb':
          // For USB connection - will auto-detect or use specific device
          printerInterface = connection.address || undefined;
          break;

        case 'network':
          // For network connection
          printerInterface = {
            type: 'tcp',
            address: connection.address,
            port: connection.port || 9100,
          };
          break;

        case 'file':
          // For testing - prints to file
          printerInterface = connection.address || './print-output.txt';
          break;
      }

      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // ESC/POS standard
        interface: printerInterface,
        characterSet: CharacterSet.PC858_EURO,
        removeSpecialCharacters: false,
        lineCharacter: '=',
        breakLine: BreakLine.WORD,
        options: {
          timeout: 5000,
        },
      });

      const isConnected = await this.printer.isPrinterConnected();
      if (!isConnected) {
        throw new Error('Printer not connected');
      }

      this.logger.log(`Printer initialized successfully: ${connection.type}`);
    } catch (error) {
      this.logger.error(`Failed to initialize printer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Print visitor badge
   */
  async printBadge(data: BadgePrintData): Promise<void> {
    try {
      if (!this.printer) {
        throw new Error('Printer not initialized');
      }

      this.printer.clear();

      // Header
      this.printer.alignCenter();
      this.printer.setTextSize(1, 1);
      this.printer.bold(true);
      this.printer.println('VISITOR BADGE');
      this.printer.bold(false);
      this.printer.drawLine();

      // Visitor info
      this.printer.alignLeft();
      this.printer.setTextNormal();
      this.printer.println('');

      this.printer.bold(true);
      this.printer.setTextSize(1, 1);
      this.printer.println(data.visitorName);
      this.printer.bold(false);
      this.printer.setTextNormal();

      if (data.company) {
        this.printer.println(`Company: ${data.company}`);
      }

      this.printer.println('');
      this.printer.println(`Badge: ${data.badgeNumber}`);
      this.printer.println(`Date: ${data.visitDate}`);
      this.printer.println(`Department: ${data.department}`);

      if (data.host) {
        this.printer.println(`Host: ${data.host}`);
      }

      // QR Code
      if (data.qrCode) {
        this.printer.println('');
        this.printer.alignCenter();

        try {
          // Convert base64 to buffer
          const qrBuffer = Buffer.from(data.qrCode.replace(/^data:image\/png;base64,/, ''), 'base64');
          // printImage expects buffer as any to work with different formats
          await this.printer.printImage(qrBuffer as any);
        } catch (error) {
          this.logger.warn(`Failed to print QR code: ${error.message}`);
          // Continue without QR code
        }
      }

      // Footer
      this.printer.println('');
      this.printer.alignCenter();
      this.printer.drawLine();
      this.printer.setTextSize(0, 0);
      this.printer.println('Please wear this badge');
      this.printer.println('at all times');

      // Cut paper
      this.printer.cut();

      // Execute print
      await this.printer.execute();
      this.logger.log(`Badge printed successfully for: ${data.visitorName}`);
    } catch (error) {
      this.logger.error(`Failed to print badge: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test printer connection
   */
  async testPrint(): Promise<void> {
    try {
      if (!this.printer) {
        throw new Error('Printer not initialized');
      }

      this.printer.clear();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.println('TEST PRINT');
      this.printer.bold(false);
      this.printer.println('');
      this.printer.println('CoreVisitor Kiosk');
      this.printer.println(`Date: ${new Date().toLocaleString()}`);
      this.printer.println('');
      this.printer.println('Printer is working correctly!');
      this.printer.cut();

      await this.printer.execute();
      this.logger.log('Test print completed successfully');
    } catch (error) {
      this.logger.error(`Test print failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get printer status
   */
  async getPrinterStatus(): Promise<{
    connected: boolean;
    name?: string;
    type?: string;
  }> {
    try {
      if (!this.printer) {
        return { connected: false };
      }

      const connected = await this.printer.isPrinterConnected();
      return {
        connected,
        type: 'ESC/POS',
      };
    } catch (error) {
      this.logger.error(`Failed to get printer status: ${error.message}`);
      return { connected: false };
    }
  }

  /**
   * Disconnect printer
   */
  async disconnect(): Promise<void> {
    if (this.printer) {
      this.printer = null;
      this.logger.log('Printer disconnected');
    }
  }
}
