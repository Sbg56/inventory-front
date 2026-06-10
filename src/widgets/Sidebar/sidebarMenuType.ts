import * as React from "react";

export type topMenuItems = {
    id: number;
    path: string;
    label: string;
    enabled: boolean;
    icon: React.ReactNode;
}

export type bottomMenuItems = {
    id: number;
    path: string;
    label: string;
    icon: React.ReactNode;
}