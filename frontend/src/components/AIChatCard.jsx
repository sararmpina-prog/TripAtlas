export default function AIChatCard({ destination }) {
    return (
        <div className="ai-chat-container">
            <div className="ai-chat__header">
                <h2>AI Assistant</h2>
                <span className="ai-badge">Coming Soon</span>
            </div>
            
            <div className="ai-chat__messages">
                {!destination ? (
                    <h5>Ask anything about...</h5>
                ) : (
                    <>
                        <h5>Ask anything about {destination}!</h5>
                    </>
                )}
                        <p>Get instant suggestions for packing lists, local restaurants, or hidden gems.</p>
            </div>

            <div className="ai-chat__input-area">
                <div className="ai-chat__input-placeholder">
                    Ask about...
                </div>
                <div className="ai-chat__btn-placeholder"></div>
            </div>
        </div>
    );
}
