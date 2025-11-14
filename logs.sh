#!/bin/bash
# CoreVisitor - Log Viewer Script
# Visualizza i log in modo più leggibile con colori e filtri

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE}     CoreVisitor - Log Viewer          ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Funzione per mostrare il menu
show_menu() {
    echo -e "${GREEN}Seleziona quale servizio visualizzare:${NC}"
    echo -e "  ${YELLOW}1)${NC} Tutti i servizi"
    echo -e "  ${YELLOW}2)${NC} Backend (NestJS)"
    echo -e "  ${YELLOW}3)${NC} Frontend (Next.js)"
    echo -e "  ${YELLOW}4)${NC} Kiosk (React PWA)"
    echo -e "  ${YELLOW}5)${NC} Solo errori (tutti i servizi)"
    echo -e "  ${YELLOW}6)${NC} Statistiche container"
    echo -e "  ${YELLOW}q)${NC} Esci"
    echo ""
    echo -ne "${CYAN}Scelta: ${NC}"
}

# Funzione per colorare i log
colorize_logs() {
    sed -e "s/ERROR/${RED}ERROR${NC}/g" \
        -e "s/WARN/${YELLOW}WARN${NC}/g" \
        -e "s/INFO/${GREEN}INFO${NC}/g" \
        -e "s/DEBUG/${BLUE}DEBUG${NC}/g" \
        -e "s/\[Nest\]/${MAGENTA}[Nest]${NC}/g" \
        -e "s/backend/${CYAN}backend${NC}/g" \
        -e "s/frontend/${GREEN}frontend${NC}/g" \
        -e "s/kiosk/${YELLOW}kiosk${NC}/g"
}

# Funzione per mostrare statistiche
show_stats() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}              Container Statistics                         ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Status
    echo -e "${GREEN}▶ Status Container:${NC}"
    docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}" | \
        awk 'NR==1 {print "\033[1;37m" $0 "\033[0m"} NR>1 {print}'
    echo ""

    # Resource usage
    echo -e "${GREEN}▶ Utilizzo Risorse:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
        $(docker-compose ps -q) 2>/dev/null | \
        awk 'NR==1 {print "\033[1;37m" $0 "\033[0m"} NR>1 {print}'
    echo ""

    # Disk usage
    echo -e "${GREEN}▶ Spazio Disco:${NC}"
    docker-compose images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | \
        awk 'NR==1 {print "\033[1;37m" $0 "\033[0m"} NR>1 {print}'
    echo ""
}

# Main loop
while true; do
    clear
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}     CoreVisitor - Log Viewer          ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    show_menu
    read choice

    case $choice in
        1)
            clear
            echo -e "${CYAN}═══ Visualizzazione: Tutti i servizi ═══${NC}"
            echo ""
            docker-compose logs -f --tail=50 | colorize_logs
            ;;
        2)
            clear
            echo -e "${CYAN}═══ Visualizzazione: Backend (NestJS) ═══${NC}"
            echo ""
            docker-compose logs -f --tail=50 backend | colorize_logs
            ;;
        3)
            clear
            echo -e "${CYAN}═══ Visualizzazione: Frontend (Next.js) ═══${NC}"
            echo ""
            docker-compose logs -f --tail=50 frontend | colorize_logs
            ;;
        4)
            clear
            echo -e "${CYAN}═══ Visualizzazione: Kiosk (React PWA) ═══${NC}"
            echo ""
            docker-compose logs -f --tail=50 kiosk | colorize_logs
            ;;
        5)
            clear
            echo -e "${RED}═══ Visualizzazione: Solo Errori ═══${NC}"
            echo ""
            docker-compose logs -f --tail=100 | grep -iE "(error|exception|fatal|critical)" | colorize_logs
            ;;
        6)
            clear
            show_stats
            echo ""
            echo -e "${YELLOW}Premi INVIO per tornare al menu...${NC}"
            read
            ;;
        q|Q)
            echo -e "${GREEN}Arrivederci!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Scelta non valida!${NC}"
            sleep 2
            ;;
    esac
done
