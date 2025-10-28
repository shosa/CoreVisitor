import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
      region: 'us-east-1', // Hardcoded region
    });
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME');
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(
          this.bucketName,
          'us-east-1', // Hardcoded region
        );
        console.log(`✅ MinIO bucket '${this.bucketName}' created`);
      } else {
        console.log(`✅ MinIO bucket '${this.bucketName}' connected`);
      }
    } catch (error) {
      console.error('❌ MinIO connection error:', error.message);
    }
  }

  /**
   * Upload documento identità o foto visitatore
   * Path: visitors/{visitorId}/{type}/{filename}
   */
  async uploadFile(
    file: Express.Multer.File,
    visitorId: string,
    type: 'document' | 'photo',
  ): Promise<string> {
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${timestamp}.${fileExtension}`;
    const filePath = `visitors/${visitorId}/${type}/${fileName}`;

    await this.minioClient.putObject(
      this.bucketName,
      filePath,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return filePath;
  }

  /**
   * Ottieni URL pre-firmato per visualizzare file
   */
  async getFileUrl(filePath: string, expirySeconds = 3600): Promise<string> {
    return await this.minioClient.presignedGetObject(
      this.bucketName,
      filePath,
      expirySeconds,
    );
  }

  /**
   * Elimina file
   */
  async deleteFile(filePath: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, filePath);
  }

  /**
   * Download file come buffer
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = await this.minioClient.getObject(
        this.bucketName,
        filePath,
      );

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
