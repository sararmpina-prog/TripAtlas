import "../styles/InfoCard.css";

function InfoCard({ children, className = "" }) {

    return (
        <div className={`info-card ${className}`.trim()}>
           {children}
        </div>
    )
}

export default InfoCard