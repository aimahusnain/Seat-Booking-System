"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSeats } from "@/hooks/useSeats";
import { Seat, TableData } from "@/types/booking";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SeatBooking = () => {
  const { seats: initialSeats, loading, error } = useSeats();
  const [tables, setTables] = useState<TableData[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (initialSeats.length > 0) {
      const groupedSeats = initialSeats.reduce(
        (acc: { [key: string]: Seat[] }, seat) => {
          if (!acc[seat.table.name]) {
            acc[seat.table.name] = [];
          }
          acc[seat.table.name].push(seat);
          return acc;
        },
        {}
      );

      const formattedTables: TableData[] = Object.entries(groupedSeats)
        .map(([tableName, seats]) => ({
          tableNumber: Number.parseInt(tableName.replace("Table", "")),
          seats: seats.sort((a, b) => a.seat - b.seat),
        }))
        .sort((a, b) => a.tableNumber - b.tableNumber);

      setTables(formattedTables);
    }
  }, [initialSeats]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        toast.info("Exited full-screen mode");
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isFullScreen]);

  const getVisibleTables = () => {
    return tables;
  };

  const getTableColor = (tableNumber: number) => {
    const colors = [
      "bg-red-100 text-red-700 border-red-300",
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-green-100 text-green-700 border-green-300",
      "bg-yellow-100 text-yellow-700 border-yellow-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-teal-100 text-teal-700 border-teal-300",
    ];
    return colors[tableNumber % colors.length];
  };

  const renderCircularTable = (table: TableData) => {
    const tableColor = getTableColor(table.tableNumber);

    return (
      <motion.div
        className={`relative w-full aspect-square mx-auto ${
          isFullScreen ? "max-w-[500px]" : "max-w-[300px]"
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        {/* Center Table Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={`relative ${tableColor} rounded-full px-4 py-2 transition-all duration-200 ease-in-out mt-5 ml-5`}
          >
            <span className="flex items-center justify-center">
              <span className={`font-semibold text-lg text-center`}>
                Table {table.tableNumber}
              </span>
            </span>
          </div>
        </div>

        {/* Circular Seats */}
        {table.seats.map((seat, index) => {
          const angle = ((index - 2.5) * 2 * Math.PI) / 10;
          const radius = 45; // Percentage of container width
          const left = 43 + Math.cos(angle) * radius;
          const top = 43 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`absolute ${
                isFullScreen ? "w-[20%]" : "w-[15%]"
              } aspect-square`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`
                        w-full h-full rounded-full
                        flex items-center justify-center
                        transition-all duration-200
                        ${
                          seat.isBooked
                            ? "" +
                              (seat.isReceived
                                ? "bg-green-200 border-green-300 text-green-600"
                                : "bg-red-200 border-red-300 text-red-600")
                            : `bg-white hover:${tableColor}`
                        }
                        border-2
                      `}
              >
                {seat.isBooked ? (
                  seat.isReceived ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="font-bold text-lg">X</span>
                  )
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      isFullScreen ? "text-lg" : ""
                    }`}
                  >
                    {seat.seat}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      className={`min-h-screen bg-zinc-50 ${
        isFullScreen ? "overflow-hidden" : ""
      }`}
    >
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Main Content - 80% on desktop, 100% on mobile */}
        <motion.div layout className="w-full">
          {/* Scrollable Table Grid */}
          <ScrollArea className="h-screen">
            <motion.div
              layout
              className={`py-6 px-8 grid gap-12`}
              style={{
                gridTemplateColumns: isFullScreen
                  ? "repeat(4, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(250px, 1fr))",
              }}
              transition={{ duration: 0.5 }}
            >
              {getVisibleTables().map((table) => renderCircularTable(table))}
            </motion.div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
};

export default SeatBooking;
