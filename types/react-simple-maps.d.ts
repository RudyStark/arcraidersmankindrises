declare module "react-simple-maps" {
  import { ReactNode, CSSProperties } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  export interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }
  export function Geographies(props: GeographiesProps): JSX.Element;

  export interface Geography {
    rsmKey: string;
    [key: string]: unknown;
  }

  export interface GeographyProps {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    filter?: string;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
  }
  export function Geography(props: GeographyProps): JSX.Element;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export function Marker(props: MarkerProps): JSX.Element;
}
