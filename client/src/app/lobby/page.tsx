"use client";
import { useState, useEffect, useContext } from "react";

import { WebsocketContext } from "@/components/socket";

export default function Lobby() {
    const ws = useContext(WebsocketContext);

    useEffect(() => {
        console.log(ws.value);
    }, [ws.value]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="main-div">lobby</div>
        </main>
    );
}
