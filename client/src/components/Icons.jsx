const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const make = (paths) => (props) => <svg {...base} {...props}>{paths}</svg>;

export const CartIcon = make(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" /></>);
export const HeartIcon = make(<path d="M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7.5a4.6 4.6 0 0 1 8 2.6c0 5.8-8 10.4-8 10.4z" />);
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>);
export const MenuIcon = make(<path d="M3 6h18M3 12h18M3 18h18" />);
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />);
export const StarIcon = (props) => <svg {...base} fill="currentColor" stroke="none" {...props}><path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3L2.8 9.5l6.4-.9z" /></svg>;
export const TruckIcon = make(<><path d="M2 6h11v10H2zM13 10h4l3 3v3h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>);
export const ShieldIcon = make(<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" />);
export const ReturnIcon = make(<><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>);
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = make(<path d="M5 12h14" />);
export const TrashIcon = make(<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />);
export const BoxIcon = make(<><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>);
