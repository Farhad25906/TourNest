export interface HeroProps {
  badge?: {
    text: string;
    icon?: React.ReactNode;
  };
  heading?: {
    line1: string;
    line2: string;
  };
  description?: string[];
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  stats?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  formCard?: {
    title: string;
    destinationLabel?: string;
    destinationPlaceholder?: string;
    travelStyleLabel?: string;
    travelStyleOptions?: string[];
    defaultTravelStyle?: string;
    submitText?: string;
    footerText?: string;
    onSubmit?: (data: { destination: string; travelStyle: string }) => void;
  };
}