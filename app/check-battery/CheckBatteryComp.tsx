'use client'

import React, { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function CheckBatteryComp() {

    const [socket, setSocket] = useState<Socket | null>(null)
    const [connected, setConnected] = useState(false)
    const [loading, setLoading] = useState(true)
    const [level, setLevel] = useState(0)
    const [charging, setCharging] = useState(false)

    useEffect(() => {
        setLoading(true)
        const socketIo = io()
        setSocket(socketIo)

        socketIo.on('connect', () => {
            setConnected(true)
            setLoading(false)
        })

        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                const sendBatteryStatus = () => {
                    socketIo.emit('battery_status', {
                        level: battery.level * 100,
                        charging: battery.charging,
                    });
                };

                sendBatteryStatus();

                // ส่งข้อมูลเมื่อระดับแบตเตอรี่เปลี่ยน
                battery.addEventListener('levelchange', sendBatteryStatus);
                battery.addEventListener('chargingchange', sendBatteryStatus);
            })
        }

        socketIo.on('battery_status', (data: { level: number, charging: boolean }) => {
            setLevel(data.level)
            setCharging(data.charging)
        })

        socketIo.on('disconnect', () => {
            setConnected(false)
            setLoading(false)
        })

        return () => {
            socketIo.disconnect()
        }
    }, [])

    return (
        <div>
            Macbook Air M1 BoomTH {connected ? 'connected' : loading ? 'loading' : 'disconnected'}
            <br />
            {loading ? 'กำลังโหลดข้อมูลแบตเตอรี่' : (
                <span>Macbook เครื่องนี้มีแบต {level}% สถานะ {charging ? 'กําลังชาร์จ' : 'ไม่ได้ชาร์จ'}</span>
            )}
        </div>
    )
}
