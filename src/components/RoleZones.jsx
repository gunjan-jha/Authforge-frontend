import { useAuth } from "../context/AuthContext";

const ZONES = [
  {
    role: "admin",
    icon: "ti-shield-lock",
    title: "Admin zone",
    desc: "Full access to user management, role assignment, and system settings.",
    bg: "#FAEEDA",
    color: "#633806",
  },
  {
    role: "seller",
    icon: "ti-store",
    title: "Seller zone",
    desc: "Manage listings, view orders, and track your sales performance.",
    bg: "#EEEDFE",
    color: "#3C3489",
  },
  {
    role: "buyer",
    icon: "ti-shopping-cart",
    title: "Buyer zone",
    desc: "Browse products, track orders, and manage your purchases.",
    bg: "#E1F5EE",
    color: "#085041",
  },
  {
    role: "all",
    icon: "ti-world",
    title: "Public zone",
    desc: "Accessible to all authenticated users regardless of role.",
    bg: "#E6F1FB",
    color: "#0C447C",
  },
];

export default function RoleZones() {
  const { user } = useAuth();
  const currentRole = user?.Role;

  const hasAccess = (zone) => zone.role === "all" || zone.role === currentRole;

  return (
    <div className="zone-grid">
      {ZONES.map((zone) => {
        const access = hasAccess(zone);
        return (
          <div
            key={zone.role}
            className={`zone-card ${!access ? "zone-locked" : ""}`}
          >
            <div
              className="zone-icon"
              style={{ background: zone.bg, color: zone.color }}
            >
              <i className={`ti ${zone.icon}`} />
            </div>
            <div className="zone-title">{zone.title}</div>
            <div className="zone-desc">{zone.desc}</div>
            {access ? (
              <div className="zone-tag zone-open">
                <i className="ti ti-circle-check" /> You have access
              </div>
            ) : (
              <div className="zone-tag zone-closed">
                <i className="ti ti-lock" /> {zone.role}s only
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
