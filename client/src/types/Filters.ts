type OptionalFilters = {
  locker?: boolean;
  shower?: boolean;
  toilet?: boolean;
  air_conditioning?: boolean;
  level?: string | null;
  price?: number | null;
  disabled?: boolean;
};

type BaseFilters = {
  sport: string;
  city: string;
  playingAt: string;
};

type Filters = BaseFilters & Partial<OptionalFilters>;
