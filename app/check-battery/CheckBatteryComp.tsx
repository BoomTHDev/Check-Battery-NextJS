'use client'

import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { CiBatteryEmpty, CiBatteryCharging, CiBatteryFull } from 'react-icons/ci'

export default function CheckBatteryComp() {

    const [connected, setConnected] = useState(false)
    const [loading, setLoading] = useState(true)
    const [level, setLevel] = useState(0)
    const [charging, setCharging] = useState(false)

    useEffect(() => {
        setLoading(true)
        const socketIo = io()

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
        <div className='text-5xl'>

            <div className='flex flex-col min-h-screen items-center justify-center gap-3'>
                {loading ? 'กำลังโหลดข้อมูลแบตเตอรี่ของคุณ' : (
                    <>
                        <div className='flex items-center gap-2'>
                            <h1>Connected Server Socket : </h1>
                            <p className={`w-16 h-16 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></p>
                        </div>
                        <h2>Battery Level : {level}%</h2>
                        <div className='flex items-center gap-2'>
                            <span>Battery Status :</span>
                            {charging ? <CiBatteryCharging size={70} /> : level === 100 ? <CiBatteryFull size={70} /> : <CiBatteryEmpty size={70} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
