import { Request } from 'express';
import { decode, verify } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { HTTP401 } from '../../errors/custom-error';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('request-handlers/security/authentication');

const KEYCLOAK_URL = `${process.env.KEYCLOAK_HOST}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const KEYCLOAK_ISSUER = `${process.env.KEYCLOAK_HOST}/realms/${process.env.KEYCLOAK_REALM}`;

/**
 * Authenticate the request by validating the authorization bearer token (JWT).
 *
 * Assign the bearer token to `req.keycloak_token`.
 *
 * @param {*} req
 * @return {*} {Promise<true>} true if the token is authenticated
 * @throws {HTTP401} if the token is not authenticated
 */
export const authenticateRequest = async function (req: Request): Promise<true> {
  try {
    if (!req?.headers?.authorization) {
      defaultLog.warn({ label: 'authenticate', message: 'authorization headers were null or missing' });
      throw new HTTP401('Access Denied');
    }

    // Authorization header should be a string with format: Bearer xxxxxx.yyyyyyy.zzzzzz
    const authorizationHeaderString = req.headers.authorization;

    // Check if the header is a valid bearer format
    if (authorizationHeaderString.indexOf('Bearer ') !== 0) {
      defaultLog.warn({ label: 'authenticate', message: 'authorization header did not have a bearer' });
      throw new HTTP401('Access Denied');
    }

    // Parse out token portion of the authorization header
    const tokenString = authorizationHeaderString.split(' ')[1];

    if (!tokenString) {
      defaultLog.warn({ label: 'authenticate', message: 'token string was null' });
      throw new HTTP401('Access Denied');
    }

    // Decode token without verifying signature
    const decodedToken = decode(tokenString, { complete: true, json: true });

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token was null' });
      throw new HTTP401('Access Denied');
    }

    // Get token header kid (key id)
    const kid = decodedToken.header && decodedToken.header.kid;

    if (!kid) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token header kid was null' });
      throw new HTTP401('Access Denied');
    }

    const jwksClient = new JwksClient({ jwksUri: KEYCLOAK_URL });

    // Get signing key from certificate issuer
    const key = await jwksClient.getSigningKey(kid);

    if (!key) {
      defaultLog.warn({ label: 'authenticate', message: 'signing key was null' });
      throw new HTTP401('Access Denied');
    }

    // Parse out public portion of signing key
    const signingKey = key.getPublicKey();

    // Verify token using public signing key
    const verifiedToken = verify(tokenString, signingKey, { issuer: [KEYCLOAK_ISSUER] });

    if (!verifiedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'verified token was null' });
      throw new HTTP401('Access Denied');
    }

    // Add the verified token to the request for future use, if needed
    req['keycloak_token'] = verifiedToken;

    return true;
  } catch (error) {
    defaultLog.warn({ label: 'authenticate', message: 'error', error });
    throw new HTTP401('Access Denied');
  }
};
