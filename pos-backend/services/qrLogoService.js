// Genera un PNG de QR con el logo de la taza de Cafeteria Aromatica embebido
// en el centro. Usa sharp (binarios prebuiltos disponibles en Windows).
//
// La estrategia es:
//   1. qrcode (level H = 30% de recuperacion) → PNG buffer del QR puro.
//   2. Construye un SVG con un circulo blanco + la taza centrada.
//   3. sharp compone el SVG sobre el PNG.
//
// El nivel H del QR permite cubrir ~25% del area central sin que deje de
// escanearse. Mantenemos el logo en ~22% del lado del QR por margen.

const QRCode = require("qrcode");
const sharp = require("sharp");

const QR_SIZE = 600;          // pixels
const LOGO_RATIO = 0.22;      // fraccion del lado del QR
const RING_PADDING = 6;       // pixels de padding entre el QR negro y el circulo blanco

const buildLogoSvg = (size) => {
    // Taza de cafe (mismo path que pos-frontend/public/coffee.svg pero
    // recoloreada en marron de la paleta calida).
    const ringR = size / 2;
    const innerR = ringR - RING_PADDING;
    const cupSize = Math.round(size * 0.62);
    const cupOffset = Math.round((size - cupSize) / 2);
    return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${ringR}" cy="${ringR}" r="${ringR}" fill="#FFFFFF"/>
    <circle cx="${ringR}" cy="${ringR}" r="${innerR}" fill="#FFF7ED" stroke="#92400E" stroke-width="2"/>
    <g transform="translate(${cupOffset}, ${cupOffset}) scale(${cupSize / 24})"
       fill="none" stroke="#8B4513" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
        <line x1="6" y1="2" x2="6" y2="4"/>
        <line x1="10" y1="2" x2="10" y2="4"/>
        <line x1="14" y1="2" x2="14" y2="4"/>
    </g>
</svg>`);
};

// Genera el PNG del QR con el logo embebido. Devuelve un Buffer (PNG).
const renderQrWithLogo = async (payload, { size = QR_SIZE } = {}) => {
    if (!payload || typeof payload !== "string") {
        throw new Error("renderQrWithLogo: payload requerido");
    }

    const qrBuffer = await QRCode.toBuffer(payload, {
        errorCorrectionLevel: "H", // alto, tolera el logo en el centro
        type: "png",
        margin: 2,
        width: size,
        color: { dark: "#1F1410", light: "#FFFFFF" },
    });

    const logoSide = Math.round(size * LOGO_RATIO);
    const logoSvg = buildLogoSvg(logoSide);

    const composed = await sharp(qrBuffer)
        .composite([{ input: logoSvg, gravity: "center" }])
        .png()
        .toBuffer();

    return composed;
};

module.exports = { renderQrWithLogo };
