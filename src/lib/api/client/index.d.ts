import { API } from './API';

export declare const api: API & {
  story: {
    createStory: (story: any) => Promise<any>;
    updateStory: (story: any) => Promise<any>;
    getStories: () => Promise<any>;
    getStory: (id: string) => Promise<any>;
  };
  controlSimulation: (data: any) => Promise<any>;
};
