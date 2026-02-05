import { NextFunction, Request, Response } from 'express';
import CustomerRepository from '../repository/customer.repository';

const customerRepo = new CustomerRepository();

/**
 * Middleware to verify customer access token from Shopify Storefront API.
 *
 * This ensures that only the authenticated customer can access their own data
 * by validating the access token and comparing the token's customer ID with
 * the route parameter customer ID.
 *
 * @param {Request} req - Express request object with:
 *   - `authorization` header: Bearer token from Storefront API
 *   - `params.customer_id`: Shopify customer ID (gid://shopify/Customer/[id] or numeric)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 *
 * @returns {void} Calls next() if token is valid and customer IDs match, otherwise sends error response
 *
 * @throws {Error} 400 - Missing customer_id parameter
 * @throws {Error} 401 - Missing, invalid, or expired access token
 * @throws {Error} 401 - Customer ID mismatch (token doesn't belong to this customer)
 * @throws {Error} 500 - Token validation failed
 *
 * @example
 * // Usage in route definition
 * router.patch(
 *   '/customers/:customer_id/metafield',
 *   customerAccessTokenVerify,
 *   metafieldController.updateMetafield
 * );
 *
 * @example
 * // Request with Bearer token
 * PATCH /api/customers/gid://shopify/Customer/123/metafield
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * @note The access token must be obtained from the Shopify Storefront API
 * @note Verified customer info is attached to req.customer.customerId for downstream handlers
 */
export const verifyCustomerAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.params.customer_id;

    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing parameter customer_id!' });
    }

    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: 'Missing access token!' });
    }

    const { customer } =
      await customerRepo.validateCustomerByAccessToken(token);

    if (!customer)
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const tokenCustomerId = customer.id; // have format of gid://shopify/Customer/[customer-id]

    // Compare customer IDs - normalize both to handle Shopify ID format
    const storefrontId = customerId.replace('gid://shopify/Customer/', '');
    const tokenId = tokenCustomerId.replace('gid://shopify/Customer/', '');

    if (storefrontId === tokenId) {
      // Store customer info in request for later use
      (req as any).customer = { customerId: tokenCustomerId };
      // proceed to next step
      return next();
    }

    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  } catch (e: any) {
    console.error('Middleware error:' + e);
    return res.status(500).json({ success: false, error: e?.message });
  }
};
