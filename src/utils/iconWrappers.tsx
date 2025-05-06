import React from 'react';
import * as fi from 'react-icons/fi';
import * as fa from 'react-icons/fa';

// Define the type for our icon component props
type IconProps = React.SVGAttributes<SVGElement> & {
  size?: number | string;
  title?: string;
};

// Create component factories
const createIconComponent = (IconComponent: any) => {
  const IconWrapper = (props: IconProps) => {
    return React.createElement(IconComponent, props);
  };
  return IconWrapper;
};

// Feather Icons
export const Settings = createIconComponent(fi.FiSettings);
export const Copy = createIconComponent(fi.FiCopy);
export const LogOut = createIconComponent(fi.FiLogOut);
export const ArrowLeft = createIconComponent(fi.FiArrowLeft);
export const EyeOff = createIconComponent(fi.FiEyeOff);
export const Eye = createIconComponent(fi.FiEye);
export const Lock = createIconComponent(fi.FiLock);
export const Shield = createIconComponent(fi.FiShield);
export const Send = createIconComponent(fi.FiSend);
export const Download = createIconComponent(fi.FiDownload);
export const FileText = createIconComponent(fi.FiFileText);
export const Plus = createIconComponent(fi.FiPlus);
export const AlertTriangle = createIconComponent(fi.FiAlertTriangle);
export const User = createIconComponent(fi.FiUser);
export const Search = createIconComponent(fi.FiSearch);
export const DollarSign = createIconComponent(fi.FiDollarSign);
export const PlusCircle = createIconComponent(fi.FiPlusCircle);
export const Check = createIconComponent(fi.FiCheck);
export const ArrowRight = createIconComponent(fi.FiArrowRight);
export const ChevronUp = createIconComponent(fi.FiChevronUp);
export const ChevronDown = createIconComponent(fi.FiChevronDown);
export const X = createIconComponent(fi.FiX);

// Font Awesome Icons
export const ExchangeAlt = createIconComponent(fa.FaExchangeAlt);
export const ShieldAlt = createIconComponent(fa.FaShieldAlt);
export const Bolt = createIconComponent(fa.FaBolt); 