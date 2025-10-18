// © 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
// This AWS Content is provided subject to the terms of the AWS Customer Agreement available at
// http://aws.amazon.com/agreement or other written agreement between Customer and either
// Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { signInWithRedirect, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Spin, Layout } from "antd";
import outputs from "../amplify_outputs.json";
import Nav from "./components/Navigation/Nav";
import home from "./media/Home.svg";
import "./index.css";
import { Button } from "@awsui/components-react";

const { Header, Content } = Layout;

Amplify.configure(outputs);

function Home(props) {
  return (
    <Layout className="site-layout">
      <Header className="site-layout-background" style={{ padding: 0 }} />
      <Content className="layout">
        <Spin spinning={props.loading} size="large">
          <Button
            className="homebutton"
            variant="primary"
            onClick={() => signInWithRedirect()}
          >
            Federated Sign In
          </Button>
          <img src={home} alt="Homepage" className="home" />
        </Spin>
      </Content>
    </Layout>
  );
}
function App() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState(null);
  const [cognitoGroups, setcognitoGroups] = useState([]);
  const [userId, setUserId] = useState(null);
  const [groupIds, setGroupIds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      // eslint-disable-next-line default-case
      switch (event) {
        case "signIn":
          console.log("User signed in");
          break;
        // eslint-disable-next-line no-fallthrough
        case "cognitoHostedUI":
          setData();
          break;
        case "signOut":
          console.log("User signed out");
          setLoading(false);
          break;
        case "signIn_failure":
          console.log("User sign in failure");
          break;
        case "cognitoHostedUI_failure":
          console.log("Sign in failure");
          break;
      }
    });

    setData();
  }, []);

  async function setData() {
    try {
      const userData = await getUser();
      setUser(userData);
      const session = await fetchAuthSession();
      const payload = session.tokens.idToken.payload;
      setcognitoGroups(payload["cognito:groups"]);
      setUserId(payload.userId);
      setGroupIds((payload.groupIds).split(','));
      setGroups((payload.groups).split(','));
      setLoading(false);
    } catch (error) {
      console.log("Error setting data:", error);
      setLoading(false);
    }
  }

  async function getUser() {
    try {
      const userData = await getCurrentUser();
      return userData;
    } catch {
      setLoading(false);
      return console.log("Not signed in");
    }
  }

  return (
    <div>
      {groups ? (
        <Nav
          user={user}
          groupIds={groupIds}
          userId={userId}
          groups={groups}
          cognitoGroups={cognitoGroups}
        />
      ) : (
        <Home loading={loading} />
      )}
    </div>
  );
}

export default App;
