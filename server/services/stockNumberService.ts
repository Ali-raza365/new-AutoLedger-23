import { Settings } from "../models";
import type { StockNumberRule } from "@shared/schema";

export class StockNumberService {
  /**
   * Generates a new stock number based on the configured rules
   * and atomically increments the sequential counter
   */
  static async generateStockNumber(context?: {
    sourceCode?: string;
    buyerId?: string;
  }): Promise<string> {
    // First, ensure settings exist and atomically increment the counter
    const settingsUpdate = await Settings.findOneAndUpdate(
      {},
      {
        $inc: { stockNumberSequentialCounter: 1 },
        $setOnInsert: {
          stockNumberPrefixRule: { type: "none" },
          stockNumberSuffixRule: { type: "none" },
          make: [],
          sources: [],
          years: [],
          status: [],
          model: [],
          colors: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    );


    const sequentialNumber = settingsUpdate
      ? settingsUpdate.stockNumberSequentialCounter
      : 101441; // first run default


    // Fetch the current settings for rule generation
    const settings = await Settings.findOne({});
    if (!settings) {
      throw new Error("Failed to retrieve settings after counter increment");
    }

    // Generate prefix
    const prefix = this.generateRulePart(
      settings.stockNumberPrefixRule || { type: "none" },
      settings,
      context
    );

    // Generate suffix
    const suffix = this.generateRulePart(
      settings.stockNumberSuffixRule || { type: "none" },
      settings,
      context
    );

    // Construct the stock number
    const stockNumber = `${prefix}${sequentialNumber}${suffix}`;

    return stockNumber;
  }

  /**
   * Generates a prefix or suffix based on the rule configuration
   */
  private static generateRulePart(
    rule: StockNumberRule,
    settings: any,
    context?: {
      sourceCode?: string;
      buyerId?: string;
    }
  ): string {
    switch (rule.type) {
      case "none":
        return "";

      case "source":
        // Use provided source code or fall back to first available source
        if (context?.sourceCode) {
          return context.sourceCode.substring(0, 2).toUpperCase();
        }
        if (settings.sources && settings.sources.length > 0) {
          return settings.sources[0].substring(0, 2).toUpperCase();
        }
        return "";

      case "buyer":
        // Use provided buyer ID or fall back to first available buyer
        if (context?.buyerId) {
          return context.buyerId.substring(0, 2).toUpperCase();
        }
        if (settings.buyers && settings.buyers.length > 0) {
          return settings.buyers[0].id.substring(0, 2).toUpperCase();
        }
        return "";

      case "custom":
        // TypeScript knows this has customValue because of discriminated union
        return rule.customValue || "";

      default:
        return "";
    }
  }

}