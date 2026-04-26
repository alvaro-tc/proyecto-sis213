import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../https";

const Home = () => {

    useEffect(() => {
      document.title = "POS | Inicio"
    }, [])

  const { data: res } = useQuery({ queryKey: ["metrics"], queryFn: getMetrics });
  const metrics = res?.data?.data || {};

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-hidden flex flex-col md:flex-row gap-3">
      {/* Left Div */}
      <div className="flex-[3] flex flex-col min-h-0 overflow-y-auto md:overflow-visible scrollbar-hide">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-4 md:px-8 mt-8">
          <MiniCard title="Ingresos Totales" icon={<BsCashCoin />} number={metrics.totalRevenue || 0} footerNum={1.0} />
          <MiniCard title="Mesas Ocupadas" icon={<GrInProgress />} number={metrics.bookedTables || 0} footerNum={1.0} />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2] flex flex-col min-h-0">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;
