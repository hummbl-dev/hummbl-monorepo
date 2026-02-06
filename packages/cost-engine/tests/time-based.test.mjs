import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Time-Based Routing', () => {
  const config = {
    enabled: true,
    timezone: 'UTC',
    peakHours: { start: 9, end: 17 },
    offPeakHours: { start: 22, end: 6 },
    peakModel: 'claude-haiku-3-5',
    offPeakModel: 'claude-opus-4',
    weekendModel: 'claude-sonnet-4',
  };

  function isInRange(hour, start, end) {
    if (start <= end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  }

  function routeByTime(config, currentTime) {
    if (!config.enabled) {
      return { model: config.peakModel, period: 'standard', reason: 'Time-based routing disabled' };
    }

    const hour = currentTime.getHours();
    const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;

    if (isWeekend) {
      return { model: config.weekendModel, period: 'weekend', reason: 'Weekend hours' };
    }

    if (isInRange(hour, config.offPeakHours.start, config.offPeakHours.end)) {
      return { model: config.offPeakModel, period: 'off-peak', reason: 'Off-peak hours' };
    }

    if (isInRange(hour, config.peakHours.start, config.peakHours.end)) {
      return { model: config.peakModel, period: 'peak', reason: 'Peak hours' };
    }

    return { model: config.peakModel, period: 'standard', reason: 'Standard hours' };
  }

  describe('Peak hours routing', () => {
    it('should use peak model during peak hours', () => {
      // Create a date that's definitely 10:00 local time (peak)
      const peakTime = new Date();
      peakTime.setHours(10, 0, 0, 0);
      // Make sure it's a weekday
      while (peakTime.getDay() === 0 || peakTime.getDay() === 6) {
        peakTime.setDate(peakTime.getDate() + 1);
      }

      const result = routeByTime(config, peakTime);

      assert.strictEqual(result.model, 'claude-haiku-3-5');
      assert.strictEqual(result.period, 'peak');
    });

    it('should detect 9am as peak start', () => {
      const nineAm = new Date();
      nineAm.setHours(9, 0, 0, 0);
      while (nineAm.getDay() === 0 || nineAm.getDay() === 6) {
        nineAm.setDate(nineAm.getDate() + 1);
      }

      const result = routeByTime(config, nineAm);

      assert.strictEqual(result.period, 'peak');
    });

    it('should not include 5pm in peak hours', () => {
      const fivePm = new Date();
      fivePm.setHours(17, 0, 0, 0);
      while (fivePm.getDay() === 0 || fivePm.getDay() === 6) {
        fivePm.setDate(fivePm.getDate() + 1);
      }

      const result = routeByTime(config, fivePm);

      assert.notStrictEqual(result.period, 'peak');
    });
  });

  describe('Off-peak hours routing', () => {
    it('should use opus during off-peak hours', () => {
      // Create a date that's definitely 23:00 local time (off-peak)
      const offPeakTime = new Date();
      offPeakTime.setHours(23, 0, 0, 0);
      // Make sure it's a weekday
      while (offPeakTime.getDay() === 0 || offPeakTime.getDay() === 6) {
        offPeakTime.setDate(offPeakTime.getDate() + 1);
      }

      const result = routeByTime(config, offPeakTime);

      assert.strictEqual(result.model, 'claude-opus-4');
      assert.strictEqual(result.period, 'off-peak');
    });

    it('should handle overnight range (22-6)', () => {
      // Create a date that's definitely 2:00 AM local time (off-peak)
      const twoAm = new Date();
      twoAm.setHours(2, 0, 0, 0);
      // Make sure it's a weekday
      while (twoAm.getDay() === 0 || twoAm.getDay() === 6) {
        twoAm.setDate(twoAm.getDate() + 1);
      }

      const result = routeByTime(config, twoAm);

      assert.strictEqual(result.period, 'off-peak');
    });
  });

  describe('Weekend routing', () => {
    it('should use weekend model on Saturday', () => {
      // Find the next Saturday
      const saturday = new Date();
      saturday.setHours(12, 0, 0, 0);
      while (saturday.getDay() !== 6) {
        saturday.setDate(saturday.getDate() + 1);
      }

      const result = routeByTime(config, saturday);

      assert.strictEqual(result.model, 'claude-sonnet-4');
      assert.strictEqual(result.period, 'weekend');
    });

    it('should use weekend model on Sunday', () => {
      // Find the next Sunday
      const sunday = new Date();
      sunday.setHours(12, 0, 0, 0);
      while (sunday.getDay() !== 0) {
        sunday.setDate(sunday.getDate() + 1);
      }

      const result = routeByTime(config, sunday);

      assert.strictEqual(result.model, 'claude-sonnet-4');
      assert.strictEqual(result.period, 'weekend');
    });
  });

  describe('Range checking', () => {
    it('should handle normal range (start < end)', () => {
      assert.strictEqual(isInRange(10, 9, 17), true);
      assert.strictEqual(isInRange(8, 9, 17), false);
      assert.strictEqual(isInRange(17, 9, 17), false);
    });

    it('should handle overnight range (start > end)', () => {
      assert.strictEqual(isInRange(23, 22, 6), true);
      assert.strictEqual(isInRange(3, 22, 6), true);
      assert.strictEqual(isInRange(10, 22, 6), false);
    });
  });

  describe('Disabled routing', () => {
    it('should use peak model when disabled', () => {
      const disabledConfig = { ...config, enabled: false };
      const result = routeByTime(disabledConfig, new Date());

      assert.strictEqual(result.model, 'claude-haiku-3-5');
      assert.strictEqual(result.period, 'standard');
      assert.strictEqual(result.reason, 'Time-based routing disabled');
    });
  });
});
