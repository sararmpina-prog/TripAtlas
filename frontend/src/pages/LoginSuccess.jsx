import WelcomeCard from "../components/WelcomeCard"

function LoginSuccess() {

    return ( 
        <div>
           <WelcomeCard>
            <h1>Hi!</h1>
            <p>What would you like to do today?</p>
            <button>PLAN A NEW TRIP</button>
            <button>VIEW MY TRIPS</button>
           </WelcomeCard>
        </div>
    )
}

export default LoginSuccess