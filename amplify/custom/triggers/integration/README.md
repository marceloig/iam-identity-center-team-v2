# IAM Identity Center Application Integration

This module automatically creates and configures an IAM Identity Center application with SAML authentication.

## Environment Variables

Add these environment variables to enable IAM Identity Center application creation:

- `IDC_INSTANCE_ARN` (required): The ARN of your IAM Identity Center instance
  - Format: `arn:aws:sso:::instance/ssoins-xxxxxxxxxx`
- `IDC_APPLICATION_NAME` (optional): Custom name for the application
  - Default: `TEAM-IDC-Application`

## Configuration

The integration handler will automatically:

1. Create an IAM Identity Center application
2. Configure SAML authentication with the Cognito User Pool
3. Set up the required OAuth grants and scopes
4. Output the application ARN for reference

## SAML Configuration

The following SAML attributes are automatically configured:

- **ACS URL**: `https://{cognito-domain}.auth.{region}.amazoncognito.com/saml2/idpresponse`
- **SAML Audience**: `urn:amazon:cognito:sp:{user-pool-id}`
- **Grant Type**: `urn:ietf:params:oauth:grant-type:saml2-bearer`
- **Scope**: `openid`

## Usage

The application creation is triggered automatically during deployment when `IDC_INSTANCE_ARN` is set.

```bash
export IDC_INSTANCE_ARN="arn:aws:sso:::instance/ssoins-xxxxxxxxxx"
export IDC_APPLICATION_NAME="MyCustomApp"
```

## Manual Testing

To test the integration handler manually:

```bash
aws lambda invoke \
  --function-name <function-name> \
  --payload '{}' \
  response.json
```
