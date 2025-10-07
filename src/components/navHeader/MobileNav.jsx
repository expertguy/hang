import React, { Fragment } from "react";
import { IoFlag, IoMap } from "react-icons/io5";
import { RiUpload2Fill } from "react-icons/ri";
import { TbHomeFilled } from "react-icons/tb";
import { Link, useLocation } from "react-router-dom";

const BottomNavItem = ({ icon, name, path = '/', isActive = false }) => {
  return (
    <>
      <Link className={`text-[#6b6a6a] ${isActive && 'active'} text-decoration-none text-center flex items-center flex-col text-sm`} to={path} >
        {icon}
        {name}
      </Link>
    </>
  )
}
const MobileNav = () => {
  const { pathname } = useLocation()
  const itemsData = [
    { icon: <TbHomeFilled size={20} />, name: 'Home', path: '/' },
    { icon: <RiUpload2Fill size={20} />, name: 'Post', path: '/post' },
    { icon: <IoFlag size={20} />, name: 'Grand Prix', path: '/grand-prix' },
    { icon: <IoMap size={20} />, name: 'Map', path: '/map' },
  ]
  return (
    <div>

      <div className="bottom-navbar">
        <div className="flex justify-around items-center gap-3 px-2 w-100 max-w-[600px]">
          {itemsData?.map((item, index) => (
            <Fragment key={index}>
              <BottomNavItem icon={item.icon} isActive={pathname === item.path} path={item.path} name={item.name} />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
