/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import "../../index.css";
import "antd/dist/antd.css";
import { Menu, Dropdown, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";

const { Text } = Typography;

function Logout(props) {
  const user = props.user;
  const history = useHistory();
  const menu = (
    <Menu>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            signOut().then(() => history.push("/"));
          }}
        >
          Logout
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-samples/iam-identity-center-team/issues">
          Report Bug
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-samples/iam-identity-center-team/issues">
          Request Feature
        </a>
      </Menu.Item>
    </Menu>
  );

  async function signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error signing out");
    }
  }

  return (
    <div>
      <Dropdown overlay={menu} placement="topRight">
        <a className="a" onClick={(e) => e.preventDefault()}>
          <Text
            style={{
              color: "#ffffff",
              marginRight: "7px",
              fontSize: "13px",
              marginLeft: "4px",
            }}
          >
            {user}
          </Text>
          <DownOutlined
            style={{
              color: "#ffffff",
            }}
          />
        </a>
      </Dropdown>
    </div>
  );
}

export default Logout;
