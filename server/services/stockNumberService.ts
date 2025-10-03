import { Settings } from "../models";
import type { StockNumberRule } from "@shared/schema";

export class StockNumberService {
  /**
   * Generates a new stock number based on the configured rules
   * and atomically increments the correct sequential counter
   */
  static async generateStockNumber(context: {
    condition?: "Used" | "New"; // add condition
    sourceCode?: string;
    buyerId?: string;
  }): Promise<string> {
    const { condition } = context;

    // Decide which counter to increment
    const counterField =
      condition === "Used"
        ? "usedStockNumberSequentialCounter"
        : condition === "New"
        ? "newStockNumberSequentialCounter"
        : "stockNumberSequentialCounter";

    // Atomically increment the chosen counter
    const settingsUpdate = await Settings.findOneAndUpdate(
      {},
      {
        $inc: { [counterField]: 1 },
        $setOnInsert: {
          stockNumberPrefixRule: { type: "none" },
          stockNumberSuffixRule: { type: "none" },
          usedStockNumberPrefixRule: { type: "none" },
          usedStockNumberSuffixRule: { type: "none" },
          newStockNumberPrefixRule: { type: "none" },
          newStockNumberSuffixRule: { type: "none" },
          sources: [],
          years: [],
          status: [],
          colors: [],
          buyers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    );

    // Sequential number before increment → first run default fallback
    const sequentialNumber = settingsUpdate
      ? (settingsUpdate as any)[counterField]
      : 1000;

    // Re-fetch settings for rule generation
    const settings = await Settings.findOne({});
    if (!settings) {
      throw new Error("Failed to retrieve settings after counter increment");
    }

    // Decide which rules to use
    let prefixRule: StockNumberRule | undefined;
    let suffixRule: StockNumberRule | undefined;

    if (condition === "Used") {
      prefixRule = settings.usedStockNumberPrefixRule || settings.stockNumberPrefixRule;
      suffixRule = settings.usedStockNumberSuffixRule || settings.stockNumberSuffixRule;
    } else if (condition === "New") {
      prefixRule = settings.newStockNumberPrefixRule || settings.stockNumberPrefixRule;
      suffixRule = settings.newStockNumberSuffixRule || settings.stockNumberSuffixRule;
    } else {
      prefixRule = settings.stockNumberPrefixRule;
      suffixRule = settings.stockNumberSuffixRule;
    }

    // Generate prefix/suffix
    const prefix = this.generateRulePart(prefixRule || { type: "none" }, settings, context);
    const suffix = this.generateRulePart(suffixRule || { type: "none" }, settings, context);

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
        return context?.sourceCode
          ? context.sourceCode.substring(0, 2).toUpperCase()
          : settings.sources?.[0]?.substring(0, 2).toUpperCase() || "";

      case "buyer":
        return context?.buyerId
          ? context.buyerId.substring(0, 2).toUpperCase()
          : settings.buyers?.[0]?.id?.substring(0, 2).toUpperCase() || "";

      case "custom":
        return rule.customValue?.toUpperCase() || "";

      default:
        return "";
    }
  }
}
