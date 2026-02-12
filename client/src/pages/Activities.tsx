import { useEffect, useState, useMemo, useCallback } from "react";
import ActivityCard from "../components/ActivityCard";
import "../styles/Activity.css";
import { useNavigate, useParams } from "react-router";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import SearchFilters from "../components/SearchFilters";
import { useMediaQuery } from "react-responsive";

const tagLabelTranslations = [
  { key: "locker", label: "Vestiaires" },
  { key: "shower", label: "Douches" },
  { key: "toilet", label: "Toilettes" },
  { key: "air_conditioning", label: "Climatisation" },
  { key: "disabled", label: "Handisport" },
  { key: "all", label: "Tout Niveu" },
  { key: "amateur", label: "Débutant" },
  { key: "begginer", label: "Intermédiaire" },
  { key: "advance", label: "Confirmé" },
];

const sortingCondition = [
  { key: "recent", label: "Plus récentes" },
  { key: "oldest", label: "Plus anciennes" },
  { key: "price", label: "Prix" },
];

const LIMIT = 10;
const userId = 1; // Replace userId with context loged in variable
const excludeFromFilterTags = ["sport", "playingAt", "city"];

function Activities() {
  const { page } = useParams();
  const currentPage = Math.max(1, Number(page) || 1);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    sport: "",
    playingAt: "",
    city: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const navigate = useNavigate();

  const translateTaglables = useCallback((key: string, value: string) => {
    const translateOptions = tagLabelTranslations.find((item) => {
      if (key === "level") {
        return item.key === value;
      }
      return item.key === key;
    });

    return {
      key,
      value: translateOptions ? translateOptions.label : null,
    };
  }, []);

  const filterTags = useMemo(() => {
    return Object.entries(filters)
      .filter(([key, value]) =>
        key === "level" || key === "price"
          ? value !== null
          : !excludeFromFilterTags.includes(key) &&
            typeof value === "boolean" &&
            value,
      )
      .map(([key, value]) => {
        if (key === "price") {
          const numValue = Number(value);
          return {
            key: "price",
            value: numValue === 0 ? "Gratuit" : `${value} €`,
          };
        }

        return translateTaglables(key, value as keyof OptionalFilters);
      });
  }, [filters, translateTaglables]);

  const removeTag = (tag: string | number) => {
    setFilters((prev) => {
      const next = { ...prev };

      if (tag === "level" || tag === "price") {
        next[tag] = null;
      } else {
        delete next[tag as keyof Filters];
      }

      return next;
    });
  };

  const isMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  useEffect(() => {
    if (!filters.sport && !filters.city && !filters.playingAt) return;
    navigate("/activities/page/1");
  }, [filters, navigate]);

  useEffect(() => {
    const fetchAndFilterActivities = async () => {
      let enrolledActivityIds: number[] = [];

      if (userId) {
        const enrollmentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/participations?userId=${userId}`,
        );
        enrolledActivityIds = await enrollmentsResponse.json();
      }

      const queryString = new URLSearchParams({
        filters: JSON.stringify(filters),
      }).toString();

      const activitiesResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/activities?page=${currentPage}&limit=${LIMIT}&${queryString}`,
      );

      const activitiesData = await activitiesResponse.json();

      const filteredActivities = userId
        ? activitiesData.activities.filter(
            (a: Activity) => !enrolledActivityIds.includes(a.id),
          )
        : activitiesData.activities;

      setActivities(filteredActivities);
      setTotalPages(activitiesData.pagination.totalPages);
      setTotalActivities(activitiesData.pagination.totalActivities);
    };

    fetchAndFilterActivities();
  }, [currentPage, filters]);

  const sortActivities = (item: string) => {
    const sortedActivities = [...activities];

    if (item === "recent") {
      sortedActivities.sort(
        (a, b) =>
          new Date(b.playing_at).getTime() - new Date(a.playing_at).getTime(),
      );
    }

    if (item === "oldest") {
      sortedActivities.sort(
        (a, b) =>
          new Date(a.playing_at).getTime() - new Date(b.playing_at).getTime(),
      );
    }

    if (item === "price") {
      sortedActivities.sort((a, b) => Number(a.price) - Number(b.price));
    }

    setActivities(sortedActivities);
  };

  return (
    <>
      {!isMobile && <p className="tagline">Que recherchez-vous ?</p>}
      <section className="page-activities">
        <div className="activities-container">
          <SearchBar setFilters={setFilters} />
          <div className="header-activity">
            <h1>Activités disponibles</h1>
            {!sortOpen ? (
              <div className="sort-dropdown-wrapper">
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setSortOpen(true)}
                >
                  <img
                    src="/icons/Vector.svg"
                    alt="sort-icon"
                    className="sort-icon"
                  />
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  tabIndex={0}
                  className="results-wrapper"
                  onClick={() => setSortOpen(false)}
                  onKeyUp={(e) => e.key === "Enter" && setSortOpen(false)}
                >
                  {totalActivities === 0 ? (
                    ""
                  ) : totalActivities < 2 ? (
                    <p>{totalActivities} résultat</p>
                  ) : (
                    <p>{totalActivities} résultats</p>
                  )}
                </button>

                <div className={`offscreen-menue ${sortOpen ? "active" : ""}`}>
                  <div className="sort-header">
                    <h3>Trie Par</h3>
                    <button
                      type="button"
                      className="sort-close-btn"
                      onClick={() => setSortOpen(false)}
                    >
                      <img className="xbtn" src="/icons/x.svg" alt="Close" />
                    </button>
                  </div>
                  {sortingCondition.map((item) => {
                    return (
                      <label key={item.key} className="criteria-label">
                        {item.label}
                        <input
                          type="radio"
                          className="sort-options"
                          value={item.key}
                          name="sort"
                          onClick={() => {
                            sortActivities(item.key);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="filter-tag-container">
            {filterTags.map(({ key, value }) => (
              <button
                type="button"
                className="criteria-tag filter-tags"
                key={key}
                onClick={() => removeTag(key)}
              >
                {" "}
                {value}
                {"  ✕"}
              </button>
            ))}
          </div>
          <section className="cards-activity">
            {totalActivities ? (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <p>Aucun résultat</p>
            )}
          </section>
        </div>
        <div className="filters-desktop">
          {!isMobile && (
            <SearchFilters setFilters={setFilters} filters={filters} />
          )}
        </div>
      </section>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}

export default Activities;
