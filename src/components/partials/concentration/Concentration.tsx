import { useState } from "react";

const Concentration: React.FC = () => {
    const [showConcentration, setShowConcentration] = useState<boolean>(false);
    const [concentrationCount, setConcentrationCount] = useState<number>(0);
    return(
        <div className="charactersheet-concentration-row">
            <button
              type="button"
              className={`charactersheet-concentration-toggle${showConcentration ? " active" : ""}`}
              onClick={() => setShowConcentration(v => !v)}
            >
              {showConcentration ? "Hide Concentration Counter" : "Show Concentration Counter"}
            </button>
            {showConcentration && (
              <button
                type="button"
                className="charactersheet-concentration-counter"
                onClick={() => setConcentrationCount(c => c + 1)}
                title="Click to increase concentration count"
              >
                Concentration: {concentrationCount}
              </button>
            )}
          </div>
    )
};

export default Concentration;