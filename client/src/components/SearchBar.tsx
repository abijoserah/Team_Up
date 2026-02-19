import { useRef, useState } from "react";
import "../styles/SearchBar.css";
import { useMediaQuery } from "react-responsive";
import SearchFilters from "./SearchFilters";

type SearchBarProps = {
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filters: Filters;
};

function SearchBar({ setFilters, filters }: SearchBarProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [error, setError] = useState({
    sport: false,
    city: false,
  });
  const [emptyInputPlayingAt, setEmptyInputPlayingAt] = useState(false);
  const [activitiesOnDropdown, setActivitiesOnDropdown] = useState<Filters>({
    sport: "",
    playingAt: "",
    city: "",
  });
  const criteriaModalRef = useRef<HTMLDialogElement>(null);

  const openCriteriaModal = () => criteriaModalRef.current?.showModal();
  const closeCriteriaModal = () => criteriaModalRef.current?.close();

  const isMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  function searchSport(e: React.ChangeEvent<HTMLInputElement>) {
    setActivitiesOnDropdown((prev) => ({ ...prev, sport: e.target.value }));

    if (e.target.value.length > 0) {
      fetch(`${import.meta.env.VITE_API_URL}/api/sports?name=${e.target.value}`)
        .then((response) => response.json())
        .then((sports) => {
          setSports(sports);
          setError((prev) => ({ ...prev, sport: sports.length === 0 }));
        });
    } else {
      setSports([]);
      setError((prev) => ({ ...prev, sport: false }));
      setFilters((prev) => ({ ...prev, sport: "" }));
    }
  }

  function selectSport(sport: string) {
    setFilters((prev) => ({ ...prev, sport: sport }));
    setActivitiesOnDropdown((prev) => ({ ...prev, sport: sport }));
    setSports([]);
  }

  function searchCity(e: React.ChangeEvent<HTMLInputElement>) {
    setActivitiesOnDropdown((prev) => ({ ...prev, city: e.target.value }));

    if (e.target.value.length > 2) {
      fetch(`https://geo.api.gouv.fr/communes?nom=${e.target.value}`)
        .then((response) => response.json())
        .then((cities) => {
          setCities(cities);
          setError((prev) => ({ ...prev, city: cities.length === 0 }));
        });
    } else {
      setCities([]);
      setError((prev) => ({ ...prev, city: false }));
      setFilters((prev) => ({ ...prev, city: "" }));
    }
  }

  function selectCity(city: string) {
    setFilters((prev) => ({ ...prev, city: city }));
    setActivitiesOnDropdown((prev) => ({ ...prev, city: city }));
    setCities([]);
  }

  function searchPlayingAt(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, playingAt: e.target.value }));
    emptyInputPlayingAt && setEmptyInputPlayingAt(false);
  }

  return (
    <>
      <section className="searchbar">
        <article>
          <svg
            className={`${error.sport ? "error-svg" : ""}`}
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <g clipPath="url(#clip0_70_28)">
              <path d="M14.9776 16.5533C13.7075 17.4934 17.657 13.4546 16.5331 14.9899C16.5612 14.9876 16.5091 15.0728 16.3343 15.2861C16.3343 15.2861 19.3358 18.2674 20.8092 19.7846C21.3207 20.3378 20.3978 21.4418 19.7708 20.8654C18.4366 19.5709 15.2795 16.3538 15.2746 16.3485L14.9776 16.5533Z" />
              <path d="M10.5672 18.0607C12.4984 18.042 14.4102 17.2421 15.7849 15.8835C17.4177 14.2699 18.2584 11.8826 17.9652 9.60337C17.4627 5.69774 14.2519 3.04724 10.5192 3.04724C7.68303 3.04724 4.92678 4.82137 3.71778 7.39387C2.79228 9.36337 2.7904 11.7412 3.71778 13.7141C4.91815 16.2686 7.6294 18.0334 10.4708 18.0607C10.503 18.0607 10.5353 18.0607 10.5672 18.0607ZM10.4787 16.8094C7.59453 16.7816 4.90353 14.5511 4.3684 11.6914C3.99115 9.67537 4.70328 7.49362 6.18678 6.06187C7.91853 4.38974 10.6407 3.82987 12.9042 4.77749C14.9292 5.62537 16.4449 7.59412 16.7243 9.76312C16.9635 11.6224 16.2964 13.5709 14.9854 14.913C13.8353 16.0905 12.2224 16.7932 10.5593 16.8094C10.5323 16.8094 10.5057 16.8094 10.4787 16.8094Z" />
            </g>
          </svg>
          <input
            className={`${error.sport ? "error-input" : ""}`}
            type="text"
            placeholder="Rechercher une activité..."
            required
            value={activitiesOnDropdown.sport}
            onChange={searchSport}
            onBlur={() => setSports([])}
          />
          <ul
            className={`${error.sport ? "dropdown-false" : sports.length > 0 && "dropdown"}`}
          >
            {error.sport ? (
              <li className="error-li">
                <p>Ce sport n'existe pas</p>
              </li>
            ) : (
              activitiesOnDropdown.sport.length > 0 &&
              sports.map((sport) => (
                <li key={sport.name}>
                  <button
                    type="button"
                    onMouseDown={() => selectSport(sport.name)}
                  >
                    {sport.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </article>
        <article>
          <svg
            className={`${error.city ? "error-svg" : ""}`}
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <g clipPath="url(#clip0_70_42)">
              <path d="M5.44744 11.7671C4.8678 10.7042 4.55995 9.51181 4.55995 8.27356C4.55995 4.23444 7.83734 0.96003 11.8804 0.96003C15.9235 0.96003 19.2009 4.23444 19.2009 8.27356C19.2009 9.44537 18.9251 10.5768 18.4032 11.5969C18.2825 11.8329 18.376 12.1221 18.612 12.2428C18.848 12.3635 19.1372 12.2701 19.2579 12.0341C19.8486 10.8794 20.1609 9.59827 20.1609 8.27356C20.1609 3.70405 16.4535 3.05176e-05 11.8804 3.05176e-05C7.30737 3.05176e-05 3.59998 3.70405 3.59998 8.27356C3.59998 9.67341 3.94861 11.0237 4.60465 12.2267C4.73156 12.4595 5.02312 12.5453 5.25586 12.4183C5.48859 12.2914 5.57437 11.9999 5.44746 11.7671L5.44744 11.7671Z" />
              <path d="M5.34924 11.597C5.21736 11.367 4.92401 11.2875 4.69404 11.4194C4.46407 11.5513 4.38457 11.8446 4.51646 12.0746L11.1052 23.5627C11.4867 24.2277 12.2728 24.2277 12.6543 23.5628L19.1886 12.1694C19.3205 11.9394 19.241 11.6461 19.011 11.5142C18.781 11.3824 18.4877 11.4619 18.3558 11.6918L11.8798 22.9837L5.34924 11.597V11.597Z" />
              <path d="M14.3298 8.25538C14.3298 6.90418 13.2332 5.80857 11.8804 5.80857C10.5276 5.80857 9.43119 6.90411 9.43119 8.25538C9.43119 9.60664 10.5276 10.7022 11.8804 10.7022C13.2332 10.7022 14.3298 9.60657 14.3298 8.25538ZM15.2898 8.25538C15.2898 10.137 13.7632 11.6622 11.8804 11.6622C9.99758 11.6622 8.47119 10.137 8.47119 8.25538C8.47119 6.37374 9.99758 4.84857 11.8804 4.84857C13.7632 4.84857 15.2898 6.37379 15.2898 8.25538Z" />
            </g>
          </svg>
          <input
            className={`${error.city ? "error-input" : ""}`}
            type="text"
            placeholder="Ville ?"
            required
            value={activitiesOnDropdown.city}
            onChange={searchCity}
            onBlur={() => setCities([])}
          />
          <ul
            className={`${error.city ? "dropdown-false" : cities.length > 0 && "dropdown"}`}
          >
            {error.city ? (
              <li className="error-li">
                <p>Cette ville n'existe pas</p>
              </li>
            ) : (
              cities?.map((city) => (
                <li key={city.code}>
                  <button
                    type="button"
                    onMouseDown={() => selectCity(city.nom)}
                  >
                    {`${city.nom}, ${city.codeDepartement}`}
                  </button>
                </li>
              ))
            )}
          </ul>
        </article>
        <article>
          <img src="/icons/calendar-input.svg" alt="Calendrier" />
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            onChange={searchPlayingAt}
            className="date-input"
          />
          <ul className={`${emptyInputPlayingAt && "dropdown-false"}`}>
            {emptyInputPlayingAt && (
              <li className="error-li">
                <p>Veuillez remplir ce champs</p>
              </li>
            )}
          </ul>
        </article>
        {isMobile && (
          <button
            type="button"
            className="filter-button"
            onClick={openCriteriaModal}
          >
            <img src="/icons/filters.png" alt="icon pour filtres" />
          </button>
        )}

        <dialog
          ref={criteriaModalRef}
          onClick={(e) => {
            if (e.target === criteriaModalRef.current) {
              closeCriteriaModal();
            }
          }}
          onKeyDown={(e) => e.key === "Escape" && closeCriteriaModal()}
          className="modal-criteria"
        >
          <SearchFilters
            onClose={closeCriteriaModal}
            setFilters={setFilters}
            filters={filters}
          />
        </dialog>
      </section>
    </>
  );
}

export default SearchBar;
