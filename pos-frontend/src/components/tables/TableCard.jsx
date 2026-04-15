import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaUserCircle } from "react-icons/fa";

const TableCard = ({ id, name, status, initials, seats, bgColor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (name) => {
    if (status === "Booked") return;

    const table = { tableId: id, tableNo: name };
    dispatch(updateTable({ table }));
    navigate(`/menu`);
  };

  const isBooked = status === "Booked";
  const color = bgColor || "#f6b100";

  return (
    <div
      onClick={() => handleClick(name)}
      className={`relative w-full bg-[#262626] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-200 border-2 
                  ${isBooked ? "border-transparent opacity-90 cursor-not-allowed" : "border-[#333] hover:-translate-y-1 hover:shadow-xl"}`}
    >
      {/* Strip of Custom Color */}
      <div className="h-3 w-full" style={{ backgroundColor: color }}></div>

      <div className="p-4 flex flex-col items-center justify-center relative">
        {/* Status indicator top right */}
        <div className="absolute top-2 right-2">
          {isBooked ? (
            <span className="text-green-500 bg-[#143627] px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              En Uso
            </span>
          ) : (
            <span className="text-yellow-500 bg-[#3d3215] px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider block">
              Libre
            </span>
          )}
        </div>

        {/* Central Graphic Container */}
        <div className="mt-4 mb-2 flex flex-col items-center justify-center">
          {isBooked ? (
            <div className="w-16 h-16 rounded-full bg-green-500 border-4 border-[#143627] flex flex-col items-center justify-center text-gray-900 shadow-inner">
              <span className="text-xl font-black">{getAvatarName(initials) || "?"}</span>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-inner"
              style={{ backgroundColor: color, color: "#111" }}
            >
               <span className="text-2xl font-black">{name}</span>
            </div>
          )}
        </div>

        <h1 className="text-white text-lg font-bold mt-1">Mesa {name}</h1>
        <p className="text-[#ababab] text-xs font-medium mt-1 flex items-center justify-center gap-1">
           <FaUserCircle className="text-yellow-500" /> {seats} Asientos
        </p>

        {isBooked && initials && (
          <p className="text-[#ababab] text-[11px] font-semibold mt-3 text-center truncate w-full px-2">
             {"Resp: " + initials}
          </p>
        )}
      </div>
    </div>
  );
};

export default TableCard;
