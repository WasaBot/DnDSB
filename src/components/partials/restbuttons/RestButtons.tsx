interface RestButtonsProps {
    handleLongRest: () => void;
    handleShortRest: () => void;
}

const RestButtons: React.FC<RestButtonsProps> = ({ handleLongRest, handleShortRest }) => {
  return (
    <div className="charactersheet-rest-btns">
      <button
        type="button"
        className="charactersheet-rest-btn"
        onClick={handleLongRest}
      >
        Long Rest
      </button>
      <button
        type="button"
        className="charactersheet-rest-btn"
        onClick={handleShortRest}
      >
        Short Rest
      </button>
    </div>
  );
};

export default RestButtons;