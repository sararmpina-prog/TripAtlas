import "../styles/WelcomeCard.css";

function WelcomeCard({children}) {

    return ( 
        <div className="welcome-card">
           {children}
        </div>
    )
}

export default WelcomeCard