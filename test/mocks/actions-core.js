module.exports = {
    info: jest.fn(),
    notice: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    group: jest.fn((_name, fn) => fn()),
};
