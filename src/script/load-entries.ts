import { ModelEntries } from './entries/models';

(async () => {
  await new ModelEntries().load();
})();
