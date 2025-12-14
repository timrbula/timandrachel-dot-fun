interface UnderConstructionProps {
  message?: string;
  showGif?: boolean;
  className?: string;
}

export default function UnderConstruction({
  message = 'This page is under construction!',
  showGif = true,
  className = '',
}: UnderConstructionProps) {
  // Construction worker GIF as data URI (simple animated placeholder)
  const constructionGif = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FFFF00'/%3E%3Cpath d='M20,80 L80,80 L50,20 Z' fill='%23000000' stroke='%23FF0000' stroke-width='3'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='24' font-weight='bold' fill='%23FF0000' text-anchor='middle'%3E!%3C/text%3E%3C/svg%3E";

  return (
    <div className={`under-construction ${className}`}>
      <div className="construction-content">
        {showGif && (
          <div className="construction-gif">
            <img
              src={constructionGif}
              alt="Under construction warning"
              width="100"
              height="100"
              className="bounce"
            />
          </div>
        )}
        
        <div className="construction-banner construction-warning">
          <span className="blink">⚠️</span>
          <span className="construction-text">{message}</span>
          <span className="blink">⚠️</span>
        </div>
        
        <p className="construction-message">
          <span className="rainbow-text">We're working hard to make this page awesome!</span>
        </p>
        
        <p className="construction-subtext">
          Check back soon for awesome updates! 🚧👷‍♀️👷‍♂️🚧
        </p>
      </div>
    </div>
  );
}

// Made with Bob
