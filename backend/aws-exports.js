// AWS Configuration - using Vite environment variables
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '',
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      loginWith: {
        email: true,
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN || 'walkinmyshoes.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [
            'http://localhost:5173',
            'http://localhost:3000',
            import.meta.env.VITE_COGNITO_REDIRECT_URI || 'https://yourdomain.com'
          ],
          redirectSignOut: [
            'http://localhost:5173',
            import.meta.env.VITE_COGNITO_LOGOUT_URI || 'https://yourdomain.com'
          ],
          responseType: 'code'
        }
      }
    }
  },
  API: {
    REST: {
      WalkInMyShoesAPI: {
        endpoint: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
      }
    }
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_ASSETS_BUCKET || 'walkinmyshoes-assets',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
    }
  }
};

export default awsConfig;
