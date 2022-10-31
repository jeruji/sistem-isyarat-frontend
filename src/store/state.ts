import { atom } from "recoil";


export interface User {
    id: string;
    name: string;
    sessionId: string;
}

export const userState = atom({
    key: "user",
    default: {name: '', id: '', sessionId: ''}
})