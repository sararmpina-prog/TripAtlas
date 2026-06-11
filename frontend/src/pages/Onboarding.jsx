import WelcomeCard from '../components/WelcomeCard';


export default function OnBoarding({ isNewAccount, onProceed }) {
  return (
    <div> {/* O fundo do mar/viagem é fixo aqui */}
      
      {isNewAccount ? (
        /* ESTADO A: Se veio do Registo */
        <WelcomeCard title="You're All Set!">
          <p>Your account was created successfully.</p>
          <p>Let's start planning your next unforgettable journey.</p>
          <button className="btn-orange" onClick={onProceed}>
            CREATE YOUR FIRST TRIP
          </button>
        </WelcomeCard>
      ) : (
        /* ESTADO B: Se veio do Login */
        <WelcomeCard title="Welcome Back!">
          <p>Hi, traveler! Ready for your next adventure?</p>
          <button className="btn-orange" onClick={onProceed}>
            PLAN A NEW TRIP
          </button>
          <button>
            VIEW MY TRIPS
          </button>
        </WelcomeCard>
      )}

    </div>
  );
}