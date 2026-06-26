import Logo from './Logo'; // Verifique se o caminho para o Logo está correto
import '../styles/ImageLayout.css';

export default function ImageLayout({ children, bgImageClass, hasOverlay = true }) {
  return (
    <div className={`image-layout ${bgImageClass}`}>
      {/* O overlay só ganha a classe 'active-overlay' se hasOverlay for true */}
      <div className={`image-overlay ${hasOverlay ? 'active-overlay' : ''}`}>
        <header className="image-header">
          <Logo /> {/* Componente reutilizado de forma limpa */}
        </header>
        <main className="image-content">
          {children}
        </main>
      </div>
    </div>
  );
}