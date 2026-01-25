

export interface BottomStat {
    value: string;
    label: string;
}

export interface HeroBannerConfig {
    bannerId: string;
    title: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl: string;
    textColor?: string;       // hex
    buttonBackgroundColor?: string; // hex
    buttonTextColor?: string; // hex
    subtitleTextColor?: string; // hex
    descriptionTextColor?: string; // hex
    bottomStats?: BottomStat[];
}