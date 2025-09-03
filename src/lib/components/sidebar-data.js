import InfoIcon from "@lucide/svelte/icons/info";
import FileIcon from "@lucide/svelte/icons/file";
import AnimalIcon from "@lucide/svelte/icons/paw-print";
import EarthIcon from "@lucide/svelte/icons/earth";

import DatabaseIcon from "@lucide/svelte/icons/database-backup";
import NetworkIcon from "@lucide/svelte/icons/network";

const SidenavIconsData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "General PNGP Info",
      id: "general-pngp-info",
      url: "#",
      icon: InfoIcon,
      isActive: false,
    },
    {
      title: "Table",
      id: "table",
      url: "#",
      icon: DatabaseIcon,
      isActive: false,
    },
    {
      title: "Search species",
      id: "search-species",
      url: "#",
      icon: AnimalIcon,
      isActive: true,
    },
    {
      title: "Taxonomy Tree",
      id: "tax_tree",
      url: "#",
      icon: NetworkIcon,
      isActive: false,
    },
  ],
};

export default SidenavIconsData;
