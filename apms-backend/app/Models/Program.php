<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'school_id',
        'name',
        'code',
        'max_capacity',
        'is_active',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}