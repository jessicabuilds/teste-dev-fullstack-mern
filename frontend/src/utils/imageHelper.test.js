import { describe, it, expect } from 'vitest';
import { getCategoryImage, getProductImage } from './imageHelper';

describe('imageHelper', () => {
  describe('getCategoryImage', () => {
    it('should return correct image for notebooks category', () => {
      const result = getCategoryImage('notebooks');
      expect(result).toBe('/images/categories/notebooks.jpg');
    });

    it('should return correct image for smartphones category', () => {
      const result = getCategoryImage('smartphones');
      expect(result).toBe('/images/categories/smartphones.jpg');
    });

    it('should return correct image for perifericos category', () => {
      const result = getCategoryImage('perifericos');
      expect(result).toBe('/images/categories/perifericos.jpg');
    });

    it('should return correct image for hardware category', () => {
      const result = getCategoryImage('hardware');
      expect(result).toBe('/images/categories/hardware.jpg');
    });

    it('should return default image for unknown category', () => {
      const result = getCategoryImage('unknown');
      expect(result).toBe('/images/categories/default.jpg');
    });

    it('should return default image for null category', () => {
      const result = getCategoryImage(null);
      expect(result).toBe('/images/categories/default.jpg');
    });

    it('should return default image for undefined category', () => {
      const result = getCategoryImage(undefined);
      expect(result).toBe('/images/categories/default.jpg');
    });

    it('should handle category with different case', () => {
      const result = getCategoryImage('NOTEBOOKS');
      expect(result).toBe('/images/categories/notebooks.jpg');
    });

    it('should handle category with whitespace', () => {
      const result = getCategoryImage('  notebooks  ');
      expect(result).toBe('/images/categories/notebooks.jpg');
    });
  });

  describe('getProductImage', () => {
    it('should return product imageUrl if it exists', () => {
      const product = {
        imageUrl: 'https://example.com/product.jpg',
        category: 'notebooks',
      };
      const result = getProductImage(product);
      expect(result).toBe('https://example.com/product.jpg');
    });

    it('should return category image if product has no imageUrl', () => {
      const product = {
        category: 'smartphones',
      };
      const result = getProductImage(product);
      expect(result).toBe('/images/categories/smartphones.jpg');
    });

    it('should return default image if product is null', () => {
      const result = getProductImage(null);
      expect(result).toBe('/images/categories/default.jpg');
    });

    it('should return default image if product is undefined', () => {
      const result = getProductImage(undefined);
      expect(result).toBe('/images/categories/default.jpg');
    });

    it('should return category image if imageUrl is empty string', () => {
      const product = {
        imageUrl: '',
        category: 'hardware',
      };
      const result = getProductImage(product);
      expect(result).toBe('/images/categories/hardware.jpg');
    });
  });
});
