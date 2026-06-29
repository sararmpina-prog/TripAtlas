// Função utilitária para o preload de imagens na pasta public
  export const preloadBackgroundImage = (imagePath) => {
  const isMobile = window.innerWidth <= 768;
  const fileName = isMobile ? `${imagePath}-mobile.avif` : `${imagePath}-desktop.avif`;
  const fullPath = `/bg/${fileName}`;

  // Evita duplicar a tag de preload se ela já existir no DOM
  if (!document.querySelector(`link[href="${fullPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = fullPath;
    document.head.appendChild(link);
  }
};