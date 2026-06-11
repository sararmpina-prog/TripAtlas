import WelcomeCard from '../../components/WelcomeCard/WelcomeCard';
import './Onboarding.css';

export default function Onboarding({ isNewAccount, onProceed }) {
  return (
    <div className="onboarding-background"> {/* O fundo do mar/viagem é fixo aqui */}
      
      {isNewAccount ? (
        /* ESTADO A: Se veio do Registo */
        <WelcomeCard title="You're All Set!">
          <p>Your account was successfully created.</p>
          <button className="btn-orange" onClick={onProceed}>
            CREATE YOUR FIRST TRIP
          </button>
        </WelcomeCard>
      ) : (
        /* ESTADO B: Se veio do Login */
        <WelcomeCard title="Welcome Back!">
          <p>Hi, traveler! Ready for your next adventure?</p>
          <button className="btn-orange" onClick={onProceed}>
            GO TO MY DASHBOARD
          </button>
        </WelcomeCard>
      )}

    </div>
  );
}