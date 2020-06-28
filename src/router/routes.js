import AboutContent from "../pages/AboutContent";
import PickerContent from "../pages/PickerContent";
import SquadContent from "../pages/SquadContent";

export const routes = [
  { path: "/", component: PickerContent },
  { path: "/squad", component: SquadContent },
  { path: "/about", component: AboutContent },
];
