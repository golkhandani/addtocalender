export type EventData = {
    title: string;
    location: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
};

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}
