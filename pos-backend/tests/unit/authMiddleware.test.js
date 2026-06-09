process.env.JWT_SECRET = 'test-secret-key';

const jwt = require('jsonwebtoken');

jest.mock('../../models/userModel', () => ({ findById: jest.fn() }));
jest.mock('../../config/config', () => ({ accessTokenSecret: 'test-secret-key' }));

const User = require('../../models/userModel');
const { isVerifiedUser } = require('../../middlewares/tokenVerification');

describe('isVerifiedUser middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('llama next(error 401) si no hay accessToken en cookies', async () => {
    await isVerifiedUser({ cookies: {} }, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({ status: 401 });
  });

  test('llama next(error 401) si el token tiene firma inválida', async () => {
    await isVerifiedUser({ cookies: { accessToken: 'bad.token.here' } }, {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({ status: 401 });
  });

  test('llama next(error 401) si el usuario no existe en la BD', async () => {
    const token = jwt.sign({ _id: '507f1f77bcf86cd799439011' }, 'test-secret-key');
    User.findById.mockResolvedValue(null);
    await isVerifiedUser({ cookies: { accessToken: token } }, {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({ status: 401 });
  });

  test('asigna req.user y llama next() sin error con token y usuario válidos', async () => {
    const mockUser = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    const token = jwt.sign({ _id: mockUser._id }, 'test-secret-key');
    User.findById.mockResolvedValue(mockUser);
    const req = { cookies: { accessToken: token } };
    await isVerifiedUser(req, {}, next);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith();
  });
});
