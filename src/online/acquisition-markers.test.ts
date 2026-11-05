import { describe, expect, it, vi } from 'vitest';
import { acquisitionMarkerOperation } from './acquisition-markers';
const rpc = vi.fn();
vi.mock('./account-client', () => ({ onlineClient: () => ({ rpc }) }));
describe('own-user synced acquisition markers', () => {
  it('reads without writes and acknowledges only supplied item keys, never caller-supplied identity or wallet', async () => {
    rpc.mockResolvedValue({ data: { revision: 7, markers: { 'material:infernic-common': false } }, error: null });
    expect(await acquisitionMarkerOperation()).toEqual({ revision: 7, markers: { 'material:infernic-common': false } });
    expect(rpc).toHaveBeenLastCalledWith('acquisition_markers', { p_keys: null });
    rpc.mockResolvedValue({ data: { revision: 7, markers: { 'material:infernic-common': true } }, error: null });
    await acquisitionMarkerOperation(['material:infernic-common']);
    expect(rpc).toHaveBeenLastCalledWith('acquisition_markers', { p_keys: ['material:infernic-common'] });
  });
  it('retains markers on uncertain errors or malformed snapshots', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'Network error' } });
    await expect(acquisitionMarkerOperation(['material:infernic-common'])).rejects.toThrow('marker is retained');
    rpc.mockResolvedValue({ data: { revision: 7, markers: { 'bad:key': true } }, error: null });
    await expect(acquisitionMarkerOperation()).rejects.toThrow('invalid response');
    rpc.mockResolvedValue({ data: { revision: 7, markers: { 'material:infernic-common': 'yes' } }, error: null });
    await expect(acquisitionMarkerOperation()).rejects.toThrow('invalid response');
  });
});
