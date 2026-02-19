import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import "../styles/Carousel.css";

type CarouselProps = {
  activities: Activity[];
  renderActivity: (activity: Activity) => React.ReactNode;
};

function Carousel({ activities, renderActivity }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
    },
    [WheelGesturesPlugin()],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const isDesktop = useMediaQuery({ query: "(min-width: 1440px)" });

  const isVisibleSlide = (
    index: number,
    selectedIndex: number,
    length: number,
    isDesktop: boolean,
  ) => {
    if (!isDesktop) {
      return index === selectedIndex;
    }

    const prev = (selectedIndex - 1 + length) % length;
    const next = (selectedIndex + 1) % length;

    return index === selectedIndex || index === prev || index === next;
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {activities.map((activity, index) => {
            const isVisible = isVisibleSlide(
              index,
              selectedIndex,
              activities.length,
              isDesktop,
            );

            return (
              <div
                key={activity.id}
                className={`embla__slide ${isVisible ? "is-visible" : ""}`}
              >
                {renderActivity(activity)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="embla__dots">
        {activities.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === selectedIndex ? "active" : ""}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
