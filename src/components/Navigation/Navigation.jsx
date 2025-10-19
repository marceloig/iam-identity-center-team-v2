import SideNavigation from "@awsui/components-react/side-navigation";
import Icon from "@awsui/components-react/icon";
import { useHistory } from "react-router-dom";

function Navigation(props) {
  const history = useHistory();
  return (
    <SideNavigation
      activeHref={props.active}
      items={[
        {
          type: "section",
          text: "Requests",
          items: [
            { type: "link", text: "Create request", href: "/requests/request" },
            { type: "link", text: "My requests", href: "/requests/view" },
          ],
        },
        {
          type: "section",
          text: "Approvals",
          items: [
            {
              type: "link",
              text: "Approve requests",
              href: "/approvals/approve",
            },
            { type: "link", text: "My approvals", href: "/approvals/view" },
          ],
        },
        {
          type: "section",
          text: "Elevated access",
          items: [
            { type: "link", text: "Active access", href: "/sessions/active" },
            { type: "link", text: "Ended access", href: "/sessions/audit" },
          ],
        },
        props.group && props.group.includes("Auditors") && props.cognitoGroups.includes("Auditors")
          ? {
              type: "section",
              text: "Audit",
              items: [
                {
                  type: "link",
                  text: "Approvals",
                  href: "/audit/approvals",
                },
                {
                  type: "link",
                  text: "Elevated access",
                  href: "/audit/sessions",
                },
              ],
            }
          : {},
        props.group && props.group.includes("Admin") && props.cognitoGroups.includes("Admin")
          ? {
              type: "section",
              text: "Administration",
              items: [
                { type: "link", text: "Approver policy", href: "/admin/approvers" },
                { type: "link", text: "Eligibility policy", href: "/admin/policy" },
                { type: "link", text: "Settings", href: "/admin/settings", info: <Icon name="settings" />},
              ],
            }
          : {},
      ]}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          props.setActiveHref(event.detail.href);
          history.push(event.detail.href);
        }
      }}
    />
  );
}

export default Navigation;
