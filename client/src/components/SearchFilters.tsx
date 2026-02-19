import "../styles/SearchFilters.css";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

type SearchFilterProps = {
  setFilters?: React.Dispatch<
    React.SetStateAction<{
      sport: string;
      playingAt: string;
      city: string;
    }>
  >;
  filters?: OptionalFilters;
  onClose?: () => void;
};

type EquipmentOptionsType = {
  key: keyof OptionalFilters;
  label: string;
};

type LevelOptionsType = {
  key: string;
  label: string;
};

const equipmentOptions: EquipmentOptionsType[] = [
  { key: "locker", label: "Vestiaires" },
  { key: "shower", label: "Douches" },
  { key: "toilet", label: "Toilettes" },
  { key: "air_conditioning", label: "Climatisation" },
];

const levelOptions: LevelOptionsType[] = [
  { key: "all", label: "Tout Niveau" },
  { key: "beginner", label: "Débutant" },
  { key: "amateur", label: "Intermédiaire" },
  { key: "advanced", label: "Confirmé" },
];

const initialState = {
  locker: false,
  shower: false,
  toilet: false,
  air_conditioning: false,
  level: null,
  price: null,
  disabled: false,
};

function SearchFilters({ filters, setFilters, onClose }: SearchFilterProps) {
  const [optionalFilters, setOptionalFilters] =
    useState<OptionalFilters>(initialState);
  const [prevPayedPrice, setPrevPayedPrice] = useState(15);

  const isFree = optionalFilters.price === 0;

  useEffect(() => {
    setOptionalFilters((prev) => {
      return {
        ...prev,
        locker: filters?.locker ?? false,
        shower: filters?.shower ?? false,
        toilet: filters?.toilet ?? false,
        air_conditioning: filters?.air_conditioning ?? false,
        level: filters?.level ?? null,
        price: filters?.price ?? null,
        disabled: filters?.disabled ?? false,
      };
    });
  }, [filters]);

  const navigate = useNavigate();

  const updateFilters = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;

    setOptionalFilters((prev) => {
      const updates: Record<string, Partial<OptionalFilters>> = {
        equipment: { [value]: checked },
        level: { level: value },
        price: { price: checked ? 0 : prevPayedPrice },
        disabled: { disabled: checked },
      };

      return {
        ...prev,
        ...updates[name],
      };
    });
  };

  const validateFilters = () => {
    setFilters?.((prev) => {
      return {
        ...prev,
        ...optionalFilters,
      };
    });
    onClose?.();
    navigate("/activities/page/1");
  };

  const resetFilters = () => {
    setOptionalFilters(initialState);
    setFilters?.((prev) => ({
      ...prev,
      ...initialState,
    }));
  };

  const isMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  return (
    <>
      <div className="modal-content">
        <div className="modal-header">
          {isMobile ? (
            <button type="button" className="modal-close" onClick={onClose}>
              ✕
            </button>
          ) : (
            <p>Filtres</p>
          )}
          <button type="button" className="modal-clear" onClick={resetFilters}>
            Tout effacer
          </button>
        </div>

        <fieldset className="criteria-fieldset">
          <legend>Équipements</legend>
          <div className="criteria-group">
            {equipmentOptions.map((e) => (
              <label key={e.key} className="criteria-label">
                {e.label}
                <input
                  type="checkbox"
                  name="equipment"
                  value={e.key}
                  checked={optionalFilters[e.key] as boolean}
                  onChange={updateFilters}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="criteria-divider" />

        <fieldset className="criteria-fieldset">
          <legend>Niveau</legend>
          <div className="criteria-group">
            {levelOptions.map((e) => {
              return (
                <label key={e.key} className="criteria-label">
                  {e.label}
                  <input
                    type="radio"
                    name="level"
                    value={e.key}
                    checked={optionalFilters.level === e.key}
                    onChange={updateFilters}
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        <hr className="criteria-divider" />

        <fieldset className="criteria-fieldset">
          <legend>Budget</legend>
          <div className="criteria-group">
            <label className="criteria-label">
              Gratuit
              <input
                type="checkbox"
                name="price"
                checked={isFree}
                onChange={updateFilters}
              />
            </label>

            <label
              className={`criteria-label criteria-label-price-desktop ${isFree && "slider-disabled"}`}
            >
              Payant
              <div className="range-price">
                <span className={`price-tag ${isFree && "slider-disabled"}`}>
                  {optionalFilters.price ? optionalFilters.price : 0}€
                </span>
                <input
                  className={`slider ${isFree && "slider-disabled"}`}
                  id="myRange"
                  type="range"
                  name="price"
                  min={0}
                  max={100}
                  value={optionalFilters.price ?? 0}
                  onChange={(e) => {
                    setOptionalFilters((prev) => {
                      const value = Number(e.target.value);
                      setPrevPayedPrice(value === 0 ? 15 : value);
                      return {
                        ...prev,
                        price: value,
                      };
                    });
                  }}
                />
                <span className={`price-tag ${isFree && "slider-disabled"}`}>
                  {" "}
                  100€
                </span>
              </div>
            </label>
          </div>
        </fieldset>

        <hr className="criteria-divider" />

        <fieldset className="criteria-fieldset">
          <legend>Type de Sport</legend>
          <div className="criteria-group">
            <label className="criteria-label">
              Handisport
              <input
                type="checkbox"
                name="disabled"
                checked={optionalFilters.disabled}
                onChange={updateFilters}
              />
            </label>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={validateFilters}
          className="btn-validate"
        >
          Valider
        </button>
      </div>
    </>
  );
}

export default SearchFilters;
